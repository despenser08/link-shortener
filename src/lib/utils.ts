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

import { Response } from "express";
import db from "quick.db";

export type Link = { name: string; link: string; requested: number };

export class LinkDB {
  get(name: string) {
    return (db.get(`link.${this._fixName(name)}`) as Link) || undefined;
  }

  get urls() {
    return (db.get("link") as Record<string, Link>) || undefined;
  }

  _set(name: string, value: Partial<Link>) {
    return db.set(`link.${this._fixName(name)}`, {
      ...this.get(name),
      ...value,
    })[name] as Link;
  }

  _fixName(name: string) {
    let fixedName = name;

    if (name.length === 1) return fixedName;

    if (name.startsWith("/")) fixedName = fixedName.slice(1);
    if (name.endsWith("/"))
      fixedName = fixedName.slice(0, fixedName.length - 1);

    return fixedName;
  }

  useLink(name: string) {
    let link = this.get(name);
    if (!link) return;

    this._set(name, { requested: ++link.requested });
    return link;
  }

  addLink(name: string, link: string) {
    return this._set(name, {
      name: this._fixName(name),
      link,
      requested: 0,
    });
  }

  updateLink(name: string, link: string) {
    return this._set(name, { link });
  }

  deleteLink(name: string) {
    return db.delete(`link.${this._fixName(name)}`);
  }
}

export function result(
  res: Response,
  code: HTTPCode,
  body: Record<string, unknown> = {}
) {
  return res.status(code).json({ code, message: HTTPCode[code], ...body });
}

export enum HTTPCode {
  OK = 200,
  Created = 201,
  "Not Modified" = 304,
  "Bad Request" = 400,
  "Not Found" = 404,
  Conflict = 409,
  "Internal Server Error" = 500,
  "Not Implemented" = 501,
}
