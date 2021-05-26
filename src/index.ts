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

import compression from "compression";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { LinkDB, result, setupRoot } from "./lib/utils";
import cors from "cors";
import "dotenv/config";

const app = express();
app.use(morgan("combined"));
app.use(cors());
app.use(rateLimit({ windowMs: 60 * 60 * 1000, max: 300 }));
app.use(helmet());
app.use(compression());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const db = new LinkDB();
setupRoot();

app.get("/", (_, res) => {
  const link = db.useLink("/");
  if (link) return res.redirect(301, link.link);

  return result(res, 200, {
    Note: "If you want this page to be redirected to a different URL, create a redirect rule with the name '/'.",
    GitHub: "https://github.com/despenser08/link-shortener",
  });
});

app.get("/:link", async (req, res, next) => {
  const link = db.useLink(req.params.link);

  if (!link) return next();
  return res.redirect(301, link.link);
});

app.use("/api", require("./routers/api"));
app.use((_, res) => result(res, 404));
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);
    return result(res, 500);
  }
);

app.listen(process.env.PORT || 8080, () =>
  console.log(`link-shortener started.`)
);
