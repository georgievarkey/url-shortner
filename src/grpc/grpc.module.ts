import { Module } from '@nestjs/common';
import { UrlGrpcService } from './url.grpc.service';
import { UrlModule } from '../url/url.module';

@Module({
  imports: [UrlModule],
  providers: [UrlGrpcService],
  exports: [UrlGrpcService],
})
export class GrpcModule {}