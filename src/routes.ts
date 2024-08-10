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

const upload = multer(uploadConfig)

const router = Router()

router.post('/sessions', new AuthUserController().handle)

router.get('/spaces/all', new ListSpacesController().handle)
router.get('/space/:spaceId', new GetSpaceController().handle)
router.get('/professional/:professionalId', new GetProfessionalController().handle)

router.post('/client', new CreateClientController().handle)
router.post('/space', upload.single("file"), new CreateSpaceController().handle)
router.post('/professional', upload.single("file"), new CreateProfessionalController().handle)

router.use(isAuthenticated)

router.get('/users', new GetUserController().handle)
router.put('/users/password', new EditPasswordUserController().handle)

router.post('/space/init', upload.single("file"), new CreateSpaceInitController().handle)
router.get('/professional/linked/spaces', new ListLinkedSpacesController().handle)
router.post('/professional/linked/:spaceId', new LinkProfessionalSpaceController().handle)
router.delete('/professional/linked/:id', new RemoveLinkedSpaceController().handle)


router.put('/client', upload.single("file"), new EditClientController().handle)
router.put('/space', upload.single("file"), new EditSpaceController().handle)
router.put('/professional', upload.single("file"), new EditProfessionalController().handle)

router.post('/space/photo', upload.single("file"), new PhotoAddSpaceController().handle)
router.post('/professional/photo', upload.single("file"), new PhotoAddProfessionalController().handle)

router.delete('/space/photo/:id', new PhotoRemoveSpaceController().handle)
router.delete('/professional/photo/:id', new PhotoRemoveProfessionalController().handle)

export { router }