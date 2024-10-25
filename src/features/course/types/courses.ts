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
export interface ModulesProps {
  id: string;
  nome: string;
  memberAt: string;
  modulos: [
    {
      aulas: number;
      id: string;
      nome: string;
      capa: string;
    }
  ]
}
export interface ClassesProps {
  id: string;
  nome: string;
  descricao: string;
  urlVideo: string;
  posicao: number;
  moduloId: string;
  thumbnail: string;
  assistida: boolean;
}

export interface LastClasse {
  id: string;
  nomeAula: string;
  thumbnail: string;
  ModuloNome: string;
  aulaAssistidaEm: string;
}