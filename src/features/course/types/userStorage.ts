export interface UserStorage {
	token: string,
	id: string,
	colorSystem: string,
	profilePhoto: string,
	createAt: string
}

export interface GetUserProps {
	id: string,
	nome: string,
	email: string,
	coresSystemUsuario: {
		corDeFundoPrimaria: string;
		corDeFundoSecundaria: string;
		corPrimaria: string;
		corSecundaria: string;
	},
	photoProfile: string | null,
	createdAt: string
}