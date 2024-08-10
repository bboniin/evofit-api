import prismaClient from '../../prisma'

interface UserRequest {
    userId: string;
}

class GetUserService {
    async execute({ userId}: UserRequest) {

        const user = await prismaClient.user.findUnique({
            where: {
                id: userId
            },
            include: {
                space: true,
                client: true,
                professional: true
            }
        })

        if (!user) {
            throw new Error("Usuário não encontrado")
        }

        switch(user.role){
            case "SPACE": {
                return ({
                    role: user.role,
                    email: user.email,
                    ...user.space
                })
            }
            case "CLIENT": {
                return ({
                    role: user.role,
                    email: user.email,
                    ...user.client
                })
            }
            case "PROFESSIONAL": {
                return ({
                    role: user.role,
                    email: user.email,
                    ...user.professional
                })
            }
        }
    }
}

export { GetUserService }