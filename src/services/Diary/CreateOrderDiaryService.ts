import api from '../../config/api';
import prismaClient from '../../prisma';

interface OrderDiaryRequest {
    spaceId: string;
    clientId: string;
    amount: number;
}

class CreateOrderDiaryService {
    async execute({ spaceId, clientId, amount }: OrderDiaryRequest) {

        const client = await prismaClient.client.findUnique({
            where: { 
                userId: clientId
            },
            include: {
                user: true
            }
        });

        if (!client) {
            throw new Error('Cliente não encontrado');
        }

        const space = await prismaClient.space.findUnique({
            where: { 
                userId: spaceId
             }
        });

        if (!space) {
            throw new Error('Espaço não encontrado');
        }

        await api.post("/orders", {
            closed: true,
            items: [
                {
                    amount: space.valueDiarie*100*amount,
                    description: "Diária Academia",
                    quantity: 1,
                    code: 1
                }
            ],
            customer: {
                name: client.name,
                type: "individual",
                document: client.cpf,
                email: client.user.email,
                phones: {
                    "mobile_phone": {
                        "country_code": "55",
                        "number": "000000000",
                        "area_code": "11"
                    }
                }
            },
            payments: [
                {
                    payment_method: "pix",
                    pix: {
                        expires_in: 3600,
                        additional_information: [
                            {
                                name: "information",
                                value: "number"
                            }
                        ]
                    },
                    split: [
                        {
                            amount: 99,
                            recipient_id: space.recipientId,
                            type: "percentage",
                            options: {
                                charge_processing_fee: false,
                                charge_remainder_fee: false,
                                liable: false
                            }
                        },
                        {
                            amount: 1,
                            recipient_id: "re_cm2uxwdzw3j720m9tiinncic7",
                            type: "percentage",
                            options: {
                                charge_processing_fee: true,
                                charge_remainder_fee: true,
                                liable: true
                            }
                        }
                    ]
                }
            ]
        }).then(async (response)=>{
            const order = await prismaClient.payment.create({
                data: {
                    name: "Diária",
                    spaceId,
                    clientId: client.id,
                    valueUnit: space.valueDiarie,
                    amount: amount,
                    value: space.valueDiarie*amount,
                    orderId: response.data.id
                },
            });

            for(let i = 0; i<amount; i++){
                await prismaClient.diary.create({
                    data: {
                        spaceId: space.id,
                        clientId: client.id,
                        paymentId: order.id,
                        used: false
                    },
                });
            }

            return order;
        }).catch((e)=>{
            console.log(e.response.data)
            throw new Error('Ocorreu um erro ao criar cobrança');
        })
    }
}

export { CreateOrderDiaryService };
