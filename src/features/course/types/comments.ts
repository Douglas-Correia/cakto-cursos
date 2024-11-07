export interface CommentsType {
    id: number,
    comentario: string,
    createdAt: string,
    respostaComentarioAulas: [
        {
            id: number,
            respostaComentario: string,
            createdAt: string
        }
    ]
}