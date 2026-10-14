import {
  DEFAULT_PERMISSION_GROUP,
  XDR_PERMISSION_CATALOG,
} from './permission-nodes';

/**
 * A port of the node-matching part of Turbo's PermissionResolver and PermissionNodeFormat
 * (turbo-cloud: Turbo.Primitives/Players/Permissions/), applied to XDR account groups.
 * Group inheritance, per-account nodes, meta and temporary node assignments are not modelled.
 */

export const WILDCARD = '*';
const WILDCARD_SUFFIX = '.*';
const MAX_NODE_LENGTH = 128;
const MAX_GROUP_NAME_LENGTH = 64;
const EXACT = Number.MAX_SAFE_INTEGER;
const NO_MATCH = -1;

export interface PermissionNodeAssignment {
  node: string;
  value: boolean;
}

export interface PermissionGroupSource {
  name: string;
  weight: number;
  nodes: PermissionNodeAssignment[];
}

export interface PermissionMembership {
  group: PermissionGroupSource;
  expiresAt: Date | null;
}

function isValidSegment(value: string): boolean {
  return /^[a-z0-9_]+$/.test(value);
}

export function isValidNode(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length <= MAX_NODE_LENGTH &&
    value.split('.').every(isValidSegment)
  );
}

export function isValidAssignment(value: unknown): value is string {
  return (
    value === WILDCARD ||
    isValidNode(value) ||
    (typeof value === 'string' &&
      value.length <= MAX_NODE_LENGTH &&
      value.endsWith(WILDCARD_SUFFIX) &&
      isValidNode(value.slice(0, -WILDCARD_SUFFIX.length)))
  );
}

export function isValidGroupName(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length <= MAX_GROUP_NAME_LENGTH &&
    isValidSegment(value)
  );
}

/**
 * How specifically an assignment names a node: exact beats the longest `prefix.*`, which beats
 * `*`. A wildcard covers nodes under its prefix, not the prefix itself.
 */
export function specificity(assignment: string, node: string): number {
  if (assignment === node) return EXACT;
  if (assignment === WILDCARD) return 0;
  if (!assignment.endsWith(WILDCARD_SUFFIX)) return NO_MATCH;
  // Keep the dot, so cms.* covers cms.audit.view but not cmsx.audit.
  const prefix = assignment.slice(0, -1);
  return node.startsWith(prefix) ? prefix.length : NO_MATCH;
}

function bestMatch(
  nodes: PermissionNodeAssignment[],
  node: string,
): PermissionNodeAssignment | null {
  let best: PermissionNodeAssignment | null = null;
  let bestSpecificity = NO_MATCH;
  for (const assignment of nodes) {
    const score = specificity(assignment.node, node);
    if (score === NO_MATCH) continue;
    // On an equally specific match a denial beats a grant.
    if (
      score > bestSpecificity ||
      (score === bestSpecificity && !assignment.value && best?.value === true)
    ) {
      best = assignment;
      bestSpecificity = score;
    }
  }
  return best;
}

/** Live memberships plus the implicit default group, each once, highest weight first. */
export function collectSources(
  memberships: PermissionMembership[],
  defaultGroup: PermissionGroupSource | null,
  now: Date,
): PermissionGroupSource[] {
  const byName = new Map<string, PermissionGroupSource>();
  for (const membership of memberships) {
    if (membership.expiresAt && membership.expiresAt.getTime() <= now.getTime())
      continue;
    byName.set(membership.group.name, membership.group);
  }
  if (defaultGroup?.name === DEFAULT_PERMISSION_GROUP) {
    byName.set(defaultGroup.name, defaultGroup);
  }
  return [...byName.values()].sort((a, b) => {
    if (b.weight !== a.weight) return b.weight - a.weight;
    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
  });
}

/**
 * Whether the sources grant `node`. The first source with an opinion decides; no opinion, or a
 * node outside the XDR catalog, is a denial.
 */
export function resolvePermission(
  sources: PermissionGroupSource[],
  node: string,
): boolean {
  if (!XDR_PERMISSION_CATALOG.has(node)) return false;
  for (const source of sources) {
    const match = bestMatch(source.nodes, node);
    if (match) return match.value;
  }
  return false;
}
