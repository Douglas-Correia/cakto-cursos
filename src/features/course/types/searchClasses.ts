export interface SearchClasses {
    PesquisaAula: [
        {
            id: string,
            nome: string,
            descricao: string,
            aulasAssistidasUsuario: [
                {
                    id: 0
                }
            ],
            Modulos: {
                id: string,
                nome: string,
                capa: string
            }
        }
    ],
    PesquisaModulo: [
        {
            id: string,
            nome: string,
            capa: string
        }
    ]
}