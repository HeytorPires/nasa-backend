import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { Request, Response } from "express";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
    private readonly logger = new Logger("Request");

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest<Request>();
        const response = context.switchToHttp().getResponse<Response>();

        const { method, url } = request;

        const clientIp = request.ip || request.headers["x-forwarded-for"] || request.socket.remoteAddress;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const user = (request as any).user?.email ?? clientIp;

        const startTime = Date.now();

        return next.handle().pipe(
            tap(() => {
                const statusCode = response.statusCode;
                const responseTime = Date.now() - startTime;

                this.logger.log(
                    `method=${method} path="${url}" status=${statusCode} from="${user}" time=${responseTime}ms`,
                );
            }),
        );
    }
}
