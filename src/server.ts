import express from 'express';
import {toDataURL} from 'qrcode';

interface QrState {
    qr: string | null;
}

export function createServer(qrState: QrState) {
    const app = express();
    const port = process.env.PORT || 3000;

    app.get('/', (req: any, res: any) => {
        if (qrState.qr) {
            toDataURL(qrState.qr, (err: any, url: any) => {
                if (err) {
                    return res.status(500).send('Erro ao gerar o QR Code.');
                }

                res.send(`
          <!DOCTYPE html>
          <html lang="pt-bt">
            <head><title>QR Code WhatsApp</title></head>
            <body style="display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f0f0f0;">
              <div>
                <h1>Escaneie o QR Code para conectar</h1>
                <img src="${url}" alt="QR Code"/>
              </div>
            </body>
          </html>
        `);
            });
        } else {
            res.status(200).send('Bot conectado ou aguardando QR Code. Atualize a página em alguns segundos.');
        }
    });

    app.listen(port, () => {
        console.log(`✅ Servidor do QR Code rodando em http://localhost:${port}`);
    });
}