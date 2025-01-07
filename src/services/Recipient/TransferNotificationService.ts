import * as OneSignal from 'onesignal-node';  

interface TransferRequest {
    data: object;
}

class TransferNotificationService {
    async execute({ data }: TransferRequest) {

        console.log(data)
/*
        const client = new OneSignal.Client('15ee78c4-6dab-4cb5-a606-1bb5b12170e1', 'OTkyODZmZmQtODQ4Ni00OWRhLWFkYmMtNDE2MDllMjgyNzQw');

            await client.createNotification({
                headings: {
                    'en': "Nova mensagem",
                    'pt': "Nova mensagem",
                },
                contents: {
                    'en': message["content"],
                    'pt': message["content"],
                },
                include_external_user_ids: [recipientId]
            })
        */
        return(data)
    }
}

export { TransferNotificationService }