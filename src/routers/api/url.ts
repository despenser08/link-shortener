/**
 * Copyright (C) 2021 despenser08
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import express from "express";
import basicAuth from "express-basic-auth";
import { LinkDB, result } from "../../lib/utils";

const router = express.Router();
const db = new LinkDB();

router.use(
  basicAuth({
    users: { admin: process.env.ADMIN_PASSWORD as string },
  })
);

router.get("/", (_, res) => {
  return result(res, 200, { links: db.urls });
});

router.post("/", (req, res) => {
  const { name } = req.body;
  if (!name) return result(res, 400);

  const link = db.get(name);
  if (!link) return result(res, 404);

  return result(res, 200, { link });
});

router.put("/", (req, res) => {
  const { name, link } = req.body;
  if (!name || !link) return result(res, 400);

  if (db.get(name)) return result(res, 409);

  const newLink = db.addLink(name, link);
  return result(res, 201, { link: newLink });
});

router.patch("/", (req, res) => {
  const { name, link } = req.body;
  if (!name || !link) return result(res, 400);

  const oldLink = db.get(name);
  if (!oldLink) return result(res, 404);
  if (oldLink.link === link) return result(res, 304);

  const newLink = db.updateLink(name, link);
  return result(res, 200, { link: newLink });
});

router.delete("/", (req, res) => {
  const { name } = req.body;
  if (!name) return result(res, 400);

  const link = db.get(name);
  if (!link) return result(res, 404);

  db.deleteLink(name);
  return result(res, 200, { link });
});

export = router;
