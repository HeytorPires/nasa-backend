import { CallHandler, ExecutionContext } from "@nestjs/common";
import { of } from "rxjs";
import { LoggerInterceptor } from "./logger.interceptor";

describe("LoggerInterceptor", () => {
    let interceptor: LoggerInterceptor;

    const mockRequest = {
        method: "GET",
        url: "/apods/2024-01-15",
        ip: "127.0.0.1",
        headers: {},
        socket: { remoteAddress: "127.0.0.1" },
    };

    const mockResponse = {
        statusCode: 200,
    };

    const mockExecutionContext: ExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue(mockRequest),
            getResponse: jest.fn().mockReturnValue(mockResponse),
        }),
        getClass: jest.fn(),
        getHandler: jest.fn(),
        getArgs: jest.fn(),
        getArgByIndex: jest.fn(),
        switchToRpc: jest.fn(),
        switchToWs: jest.fn(),
        getType: jest.fn(),
    };

    const mockCallHandler: CallHandler = {
        handle: jest.fn().mockReturnValue(of({ data: "test" })),
    };

    beforeEach(() => {
        interceptor = new LoggerInterceptor();
    });

    it("should be defined", () => {
        expect(interceptor).toBeDefined();
    });

    it("should call next.handle and return the observable", (done) => {
        const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

        result.subscribe({
            next: (value) => {
                expect(value).toEqual({ data: "test" });
            },
            complete: () => {
                expect(mockCallHandler.handle).toHaveBeenCalled();
                done();
            },
        });
    });

    it("should log the request details", (done) => {
        const logSpy = jest.spyOn((interceptor as any).logger, "log").mockImplementation();

        const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

        result.subscribe({
            complete: () => {
                expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('method=GET path="/apods/2024-01-15"'));
                expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("status=200"));
                expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("time="));
                logSpy.mockRestore();
                done();
            },
        });
    });

    it("should use user email if available", (done) => {
        const requestWithUser = {
            ...mockRequest,
            user: { email: "user@test.com" },
        };

        const contextWithUser: ExecutionContext = {
            ...mockExecutionContext,
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue(requestWithUser),
                getResponse: jest.fn().mockReturnValue(mockResponse),
            }),
        };

        const logSpy = jest.spyOn((interceptor as any).logger, "log").mockImplementation();

        const result = interceptor.intercept(contextWithUser, mockCallHandler);

        result.subscribe({
            complete: () => {
                expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('from="user@test.com"'));
                logSpy.mockRestore();
                done();
            },
        });
    });

    it("should use x-forwarded-for header as fallback", (done) => {
        const forwardedIp = ["10", "0", "0", "1"].join(".");
        const requestWithForwardedFor = {
            ...mockRequest,
            ip: undefined,
            headers: { "x-forwarded-for": forwardedIp },
        };

        const contextWithForwardedFor: ExecutionContext = {
            ...mockExecutionContext,
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue(requestWithForwardedFor),
                getResponse: jest.fn().mockReturnValue(mockResponse),
            }),
        };

        const logSpy = jest.spyOn((interceptor as any).logger, "log").mockImplementation();

        const result = interceptor.intercept(contextWithForwardedFor, mockCallHandler);

        result.subscribe({
            complete: () => {
                expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(`from="${forwardedIp}"`));
                logSpy.mockRestore();
                done();
            },
        });
    });
});
