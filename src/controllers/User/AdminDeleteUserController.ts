import { Request, Response } from "express";
import { AdminDeleteUserService } from "../../services/User/AdminDeleteUserService";

class AdminDeleteUserController {
  async handle(req: Request, res: Response) {
    const { idDelete } = req.body;

    const userId = req.userId;

    const admindeleteUserService = new AdminDeleteUserService();

    const user = await admindeleteUserService.execute({
      userId,
      idDelete,
    });

    return res.json(user);
  }
}

export { AdminDeleteUserController };
