import { Router } from 'express'
import multer from 'multer'

import { isAuthenticated } from './middlewares/isAuthenticated'

import uploadConfig from './config/multer'

import { AuthUserController } from './controllers/User/AuthUserController'
import { ListSpacesController } from './controllers/Space/ListSpacesController'
import { GetSpaceController } from './controllers/Space/GetSpaceController'
import { GetProfessionalController } from './controllers/Professional/GetProfessionalController'
import { CreateClientController } from './controllers/Client/CreateClientController'
import { CreateSpaceController } from './controllers/Space/CreateSpaceController'
import { CreateProfessionalController } from './controllers/Professional/CreateProfessionalController'
import { EditClientController } from './controllers/Client/EditClientController'
import { EditSpaceController } from './controllers/Space/EditSpaceController'
import { EditProfessionalController } from './controllers/Professional/EditProfessionalController'
import { PhotoRemoveSpaceController } from './controllers/Space/PhotoRemoveSpaceController'
import { PhotoRemoveProfessionalController } from './controllers/Professional/PhotoRemoveProfessionalController'
import { PhotoAddSpaceController } from './controllers/Space/PhotoAddSpaceController'
import { PhotoAddProfessionalController } from './controllers/Professional/PhotoAddProfessionalController'
import { GetUserController } from './controllers/User/GetUserController'
import { EditPasswordUserController } from './controllers/User/EditPasswordController'
import { LinkProfessionalSpaceController } from './controllers/Professional/LinkProfessionalSpaceController'
import { CreateSpaceInitController } from './controllers/Professional/CreateSpaceInitController'
import { ListLinkedSpacesController } from './controllers/Professional/ListLinkedSpacesController'
import { RemoveLinkedSpaceController } from './controllers/Professional/RemoveLinkedSpaceController copy'
import { EditSpaceInitController } from './controllers/Professional/EditSpaceInitController'
import { PhotoEditSpaceController } from './controllers/Space/PhotoEditSpaceController'
import { PhotoEditProfessionalController } from './controllers/Professional/PhotoEditProfessionalController'
import { PhotoListSpaceController } from './controllers/Space/PhotoListSpaceController'
import { PhotoListProfessionalController } from './controllers/Professional/PhotoListProfessionalController'
import { CreateClientProfessionalController } from './controllers/ClientProfessional/CreateClientProfessionalController'
import { EditClientProfessionalController } from './controllers/ClientProfessional/EditClientProfessionalController'
import { ListClientsProfessionalController } from './controllers/ClientProfessional/ListClientsProfessionalController'
import { GetClientProfessionalController } from './controllers/ClientProfessional/GetClientProfessionalController'
import { DeleteClientProfessionalController } from './controllers/ClientProfessional/DeleteClientProfessionalController'
import { DeleteScheduleProfessionalController } from './controllers/Schedule/DeleteScheduleProfessionalService'
import { DayScheduleProfessionalController } from './controllers/Schedule/DayScheduleProfessionalService'
import { ListScheduleProfessionalController } from './controllers/Schedule/ListScheduleProfessionalService copy 2'
import { EditScheduleProfessionalController } from './controllers/Schedule/EditScheduleProfessionalController'
import { CreateBookingController } from './controllers/Booking/CreateBookingController'
import { MyBookingController } from './controllers/Booking/MyBookingController'
import { FrequencyBookingController } from './controllers/Booking/FrequencyBookingController'
import { DayWeekScheduleProfessionalController } from './controllers/Schedule/DayWeekScheduleProfessionalService'
import { ClassesScheduleProfessionalController } from './controllers/Schedule/ClassesScheduleProfessionalController'
import { BlocksScheduleProfessionalController } from './controllers/Schedule/BlocksScheduleProfessionalController'
import { CreateBlockScheduleProfessionalController } from './controllers/Schedule/CreateBlockScheduleProfessionalController'
import { EditBlockScheduleProfessionalController } from './controllers/Schedule/EditBlockScheduleProfessionalController'
import { ListChatsController } from './controllers/Chat/ListChatsController'
import { GetChatController } from './controllers/Chat/GetChatController'
import { PasswordForgotController } from './controllers/User/PasswordForgotController'
import { PasswordResetController } from './controllers/User/PasswordResetController'
import { PasswordVerifyResetController } from './controllers/User/PasswordVerifyResetController'
import { DeleteUserController } from './controllers/User/DeleteUserController'
import { OrderNotificationController } from './controllers/Payment/OrderNotificationController'
import { RecipientNotificationController } from './controllers/Payment/RecipientNotificationController'

const upload = multer(uploadConfig)

const router = Router()

router.post('/sessions', new AuthUserController().handle)

router.get('/spaces/all', new ListSpacesController().handle)
router.get('/space/p/:spaceId', new GetSpaceController().handle)
router.get('/professional/p/:professionalId', new GetProfessionalController().handle)

router.post('/client', new CreateClientController().handle)
router.post('/space', upload.single("file"), new CreateSpaceController().handle)
router.post('/professional', upload.single("file"), new CreateProfessionalController().handle)
router.post('/passwords-forgot', new PasswordForgotController().handle)
router.post('/passwords-reset/:id', new PasswordResetController().handle)
router.post('/passwords-verify-reset/:code', new PasswordVerifyResetController().handle)

router.post('/order', new OrderNotificationController().handle)
router.post('/recipient', new RecipientNotificationController().handle)

router.use(isAuthenticated)

router.get('/users', new GetUserController().handle)
router.put('/users/password', new EditPasswordUserController().handle)
router.post('/user-delete', new DeleteUserController().handle)

router.post('/space/init', upload.single("file"), new CreateSpaceInitController().handle)
router.put('/space/init/:spaceId', upload.single("file"), new EditSpaceInitController().handle)
router.get('/professional/linked/spaces', new ListLinkedSpacesController().handle)
router.post('/professional/linked/:spaceId', new LinkProfessionalSpaceController().handle)
router.delete('/professional/linked/:id', new RemoveLinkedSpaceController().handle)

router.put('/client', upload.single("file"), new EditClientController().handle)
router.put('/space', upload.single("file"), new EditSpaceController().handle)
router.put('/professional', upload.single("file"), new EditProfessionalController().handle)

router.get('/photos/space', new PhotoListSpaceController().handle)
router.get('/photos/professional', new PhotoListProfessionalController().handle)

router.post('/space/photo', upload.single("file"), new PhotoAddSpaceController().handle)
router.post('/professional/photo', upload.single("file"), new PhotoAddProfessionalController().handle)

router.put('/space/photo/:id', upload.single("file"), new PhotoEditSpaceController().handle)
router.put('/professional/photo/:id', upload.single("file"), new PhotoEditProfessionalController().handle)

router.delete('/space/photo/:id', new PhotoRemoveSpaceController().handle)
router.delete('/professional/photo/:id', new PhotoRemoveProfessionalController().handle)

router.post('/professional/client', new CreateClientProfessionalController().handle)
router.put('/professional/client/:clientId', new EditClientProfessionalController().handle)
router.get('/professional/client/:id', new GetClientProfessionalController().handle)
router.get('/professional/clients', new ListClientsProfessionalController().handle)
router.delete('/professional/client/:clientId', new DeleteClientProfessionalController().handle)

router.post('/schedule', new EditScheduleProfessionalController().handle)
router.get('/schedule', new ListScheduleProfessionalController().handle)
router.get('/schedule/date/:professionalId', new DayScheduleProfessionalController().handle)
router.get('/schedule/classes', new ClassesScheduleProfessionalController().handle)
router.get('/schedule/blocks', new BlocksScheduleProfessionalController().handle)
router.post('/schedule/block', new CreateBlockScheduleProfessionalController().handle)
router.put('/schedule/block/:blockId', new EditBlockScheduleProfessionalController().handle)
router.get('/schedule/:dayWeek', new DayWeekScheduleProfessionalController().handle)
router.delete('/schedule/:scheduleId', new DeleteScheduleProfessionalController().handle)
router.delete('/schedule/block/:blockId', new EditBlockScheduleProfessionalController().handle)

router.post('/booking', new CreateBookingController().handle)
router.get('/client/schedule', new MyBookingController().handle)
router.get('/client/frequency', new FrequencyBookingController().handle)

router.get('/chats', new ListChatsController().handle)
router.get('/chat/:recipientId', new GetChatController().handle)


export { router }