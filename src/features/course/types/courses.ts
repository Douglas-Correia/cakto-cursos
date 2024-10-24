export interface CoursesProps {
    id: string;
    nome: string;
    logoCurso: string;
    memberAt: string;
    bannerCurso: 
      {
        id: number;
        titulo: string;
        descricao: string;
        posicao: number;
        image: string;
        createdAt: string;
      }
}