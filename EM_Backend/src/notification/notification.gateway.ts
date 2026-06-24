import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/notifications',
  cors: { origin: '*' },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth as any)?.token ||
        (client.handshake.headers?.authorization as string)?.replace(
          'Bearer ',
          '',
        );
      if (!token) return client.disconnect();
      const payload = this.jwtService.verify<{ sub: string }>(token);
      client.data.userId = payload.sub;
      client.join(`user-${payload.sub}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(_client: Socket) {}

  sendToUser(userId: string, data: any) {
    this.server.to(`user-${userId}`).emit('notification', data);
  }
}
