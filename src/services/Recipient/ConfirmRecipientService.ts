import api from '../../config/api';
import prismaClient from '../../prisma';

interface RecipientRequest {
    recipientId: string;
    userId: string;
}

class ConfirmRecipientService {
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
            let confirm = {}

            await api.post(`/recipients/${recipientId}/kyc_link`).then((response)=>{
                confirm = response.data
            }).catch((e)=>{
                console.log(e.response.data)
                throw new Error('Ocorreu um erro ao enviar link para confirmação de identidade');
            })
            
            return confirm
        }else{
            throw new Error('Ocorreu um erro ao enviar link para confirmação de identidade');
        }

    }
}

export { ConfirmRecipientService };
