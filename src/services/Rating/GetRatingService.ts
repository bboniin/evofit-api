import prismaClient from '../../prisma';

interface RatingRequest {
    userId: string;
    professionalId: string;
    spaceId: string;
}

class GetRatingService {
    async execute({ userId, professionalId, spaceId }: RatingRequest) {

        if (!spaceId && !professionalId) {
            throw new Error('Id do avaliado não enviado');
        }
        
        const rating = await prismaClient.rating.findFirst({
            where: spaceId ? { 
                clientId: userId,
                spaceId: spaceId
             } : {
                clientId: userId,
                professionalId: professionalId
             }
        });

        if (rating) {
            return true
        }else{
            return false
        }
    }
}

export { GetRatingService };
