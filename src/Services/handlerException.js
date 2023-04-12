import { handlerException } from '@codificar/use-log-errors/src/api/interceptors/exceptionHandler.interceptor';

export const handleException = ({errorInfo, error, baseUrl = GLOBAL.appUrl, appType = GLOBAL.type}) => {
    handlerException({
        errorInfo,
        error,
        baseUrl,
        appType 
    });
};