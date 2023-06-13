import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigModule } from 'src/config/app/app-config.module';
import { TokenConfigModule } from 'src/config/token/token-config.module';

@Module({
    imports: [
        AppConfigModule, 
        JwtModule,
        TokenConfigModule
    ],
    exports: [
        AppConfigModule, 
        JwtModule,
        TokenConfigModule
    ]
})
export class SharedModule {}
