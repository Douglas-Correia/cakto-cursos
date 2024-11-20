export interface CoursesProps {
  id: string;
  nome: string;
  logoCurso: string;
  memberAt: string;
  bannerCurso: BannerCourse;
}
export interface BannerButton {
  id: number;
  titulo: string;
  link: string;
  cor: string;
}
export interface BannerCourse {
  id: number;
  titulo: string;
  descricao: string;
  posicao: number;
  image: string;
  createdAt: string;
  botaoBannerCurso: BannerButton[];
}
export interface BannerCursoData {
  bannerCurso: BannerCourse[][];
}
export interface ModulesProps {
  id: string;
  nome: string;
  memberAt: string;
  comunidade: string;
  links: string;
  modulos: {
    aulas: number;
    id: string;
    nome: string;
    capa: string;
    porcentagemAssistida: number;
    somaDuracaoAulas: string;
  }[]
}
export interface ClassesProps {
  id: string;
  nome: string;
  descricao: string;
  urlVideo: string;
  duration: string;
  currentTime: string;
  posicao: number;
  isCompleted: boolean;
  moduloId: string;
  thumbnail: string;
  assistida: boolean;
  notaAula: number;
  notaUser: number;
  duracaoAula: string;
}

export interface LastClasse {
  id: string;
  nomeAula: string;
  thumbnail: string;
  currentTime: string;
  duration: string;
  logoCurso: string;
  moduloNome: string;
  isCompleted: boolean;
  moduloId: string;
  description: string;
  notaAula: number;
  notaUser: number;
  aulaAssistidaEm: boolean;
  urlVideo: string;
  duracaoAula: string;
}

export interface ModuleSingleProps {
  aulas: number;
  id: string;
  nome: string;
  capa: string;
  porcentagemAssistida: number;
  somaDuracaoAulas: string;
}