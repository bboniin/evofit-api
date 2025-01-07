import prismaClient from '../../prisma';

interface OrderDiaryRequest {
    diaryId: string;
}

class UsedDiaryService {
    async execute({ diaryId }: OrderDiaryRequest) {

        const diary = await prismaClient.diary.findUnique({
            where: { 
                id: diaryId
             }
        });

        if (!diary) {
            throw new Error('Diária não encontrada');
        }

        if (diary.used) {
            throw new Error('Diária já foi utilizada');
        }

        if(diary.status != "paid"){
            throw new Error('Pagamento de diária não confirmado');
        }

        const order = await prismaClient.diary.update({
            where: {
                id: diaryId
            },
            data: {
                used: true,
                dateUsed: new Date()
            },
        });

        return order;
    }
}

export { UsedDiaryService };
