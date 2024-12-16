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
