import api from '../../config/api';
import prismaClient from '../../prisma';

interface PaymentRequest {
    userId: string;
}

class GetWithdrawalsService {
    async execute({ userId }: PaymentRequest) {
        
        const spaceOrProfessional = await prismaClient.user.findUnique({
            where: { 
                id: userId
            },
            include: {
                space: true,
                professional: true,
            },
        });

        if(!spaceOrProfessional){
            throw new Error('Usuário não encontrado');
        }else{
            if (!spaceOrProfessional.space && !spaceOrProfessional.professional) {
                throw new Error('Usuário não encontrado');
            }    
        }

        const user = spaceOrProfessional.space || spaceOrProfessional.professional

        let withdrawals = {}

        await api.get(`/recipients/${user.recipientId}/withdrawals`).then((response)=>{
            withdrawals = response.data
        }).catch((e)=>{
            throw new Error('Ocorreu um erro ao obter informações do pedido');
        })

        return {
            withdrawals: withdrawals
        }
    }
}

export { GetWithdrawalsService };
