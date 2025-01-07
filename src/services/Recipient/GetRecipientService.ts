import api from '../../config/api';
import prismaClient from '../../prisma';

interface RecipientRequest {
    recipientId: string;
    userId: string;
}

class GetRecipientService {
    async execute({ userId, recipientId }: RecipientRequest) {

        const spaceOrProfessional = await prismaClient.user.findUnique({
            where: { 
                id: userId
            },
            include: {
                space: true,
                professional: true,
            },
        });

        if (!spaceOrProfessional.space && !spaceOrProfessional.professional) {
            throw new Error('Usuário não encontrado');
        }



        const myRecipient = spaceOrProfessional.space?.recipientId == recipientId || spaceOrProfessional.professional?.recipientId == recipientId

        if (myRecipient) {
            let recipient = {}

            await api.get(`/recipients/${recipientId}`).then((response)=>{
                recipient = response.data
            }).catch((e)=>{
                throw new Error('Ocorreu um erro ao obter conta bancária');
            })
            
            return recipient
        }else{
            return {}
        }

    }
}

export { GetRecipientService };
