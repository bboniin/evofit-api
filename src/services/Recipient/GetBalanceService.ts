import api from '../../config/api';
import prismaClient from '../../prisma';

interface PaymentRequest {
    userId: string;
}

class GetBalanceService {
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

        let balance = {}

        await api.get(`/recipients/${user.recipientId}/balance`).then((response)=>{
            balance = response.data
        }).catch((e)=>{
            throw new Error('Ocorreu um erro ao obter informações do pedido');
        })


        const payments = await prismaClient.payment.findMany({
            where: {
                OR: [{
                    spaceId: userId,
                },{
                    professionalId: userId,
                }]
            },
            orderBy: {
                date: "desc"
            },
            include: {
                client: true
            }
        })

        return {
            balance: balance, 
            payments: payments
        }
    }
}

export { GetBalanceService };
