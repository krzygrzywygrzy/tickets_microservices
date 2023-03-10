import request from "supertest";
import { app } from "../../app";
import { Routes } from "../utils";
import { Types } from "mongoose";
import { Order } from "../../models";
import { Ticket } from "../../models/Ticket";

const ticketId = new Types.ObjectId();
const ticketPrice = 20;

const createTicket = async () => {
  const ticket = new Ticket({ id: ticketId, price: ticketPrice });
  await ticket.save();
};

describe("create order route", () => {
  it("should throw 401 when user is not authenticated", async () => {
    const ticketId = new Types.ObjectId();

    const response = await request(app)
      .post(Routes.INDEX)
      .send({ ticketId, amount: 2 });

    expect(response.statusCode).toEqual(401);
  });

  it("should throw 400 when amount is less than 1", async () => {
    const ticketId = new Types.ObjectId();

    const response = await request(app)
      .post(Routes.INDEX)
      .set("Authorization", "Bearer token")
      .send({ ticketId, amount: -13 });

    expect(response.statusCode).toEqual(400);
  });

  it("should throw 400 when ticket id has wrong format", async () => {
    const ticketId = "asdasdas";

    const response = await request(app)
      .post(Routes.INDEX)
      .set("Authorization", "Bearer token")
      .send({ ticketId, amount: -13 });

    expect(response.statusCode).toEqual(400);
  });

  it("should create succesfully create new order", async () => {
    await createTicket();

    let orders = await Order.find({});
    expect(orders.length).toBe(0);

    const amount = 2;

    const response = await request(app)
      .post(Routes.INDEX)
      .set("Authorization", "Bearer token")
      .send({ ticketId, amount });

    const { statusCode, body } = response;

    expect(statusCode).toEqual(201);
    expect(body.id).toBeDefined();
    expect(body.amount).toEqual(amount);

    orders = await Order.find({});
    expect(orders.length).toBe(1);
  });
});
