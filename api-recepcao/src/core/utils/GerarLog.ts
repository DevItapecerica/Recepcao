import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Simula __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho do diretório de log
const LogDir = path.join(__dirname, "../../log");

export class Log {
  static GerarErrorLog = (request: any, error: any): void => {
    // Obtém o código de status ou define como 500 por padrão
    const { code = 500, message, ok, api, validation, stack } = error;

    // Caminho do arquivo de log
    const ErrorlogFilePath = path.join(LogDir, "error_log.json");

    // Dados para log
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: {
        ok: ok,
        message: message,
        validation: validation,
        code: code,
        stack: stack,
        api: api,
      },
      request: {
        method: request.method,
        url: request.url,
        ip: request.ip,
        headers: request.headers,
        body: request.body,
      },
    };

    Log.CreateLog(ErrorlogFilePath, errorLog);
  };

  static GerarRequestLog = (request: any) => {
    const RequestlogFilePath = path.join(LogDir, "request_log.json");

    const requestLog = {
      timestamp: new Date().toISOString(),
      request: {
        method: request.method,
        url: request.url,
        ip: request.ip,
        headers: request.headers,
        body: request.body,
      },
    };

    Log.CreateLog(RequestlogFilePath, requestLog);
  };

  static CreateLog = (path: string, log: object) => {
    // Lê o arquivo existente e adiciona o novo log
    fs.readFile(path, "utf8", (readErr, data) => {
      let logs = [];

      if (!readErr && data) {
        try {
          logs = JSON.parse(data);
        } catch (parseErr) {
          console.error(
            "Erro ao parsear o arquivo de log no path: ",
            path,
            parseErr
          );
        }
      }

      logs.push(log);

      fs.writeFile(path, JSON.stringify(logs, null, 2), "utf8", (writeErr) => {
        if (writeErr) {
          console.error("Erro ao escrever no arquivo de log:", writeErr);
        }
      });
    });
  };
}
