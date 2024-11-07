export interface CommentsType {
    id: number;
    comentario: string;
    createdAt: string;
    usuarioName: string;
    usuarioPhotoProfile: string;
    respostaComentarioAulas: [
        {
            id: number;
            respostaComentario: string;
            createdAt: string;
            usuarioName: string;
            usuarioPhotoProfile: string;
        }
    ]
}