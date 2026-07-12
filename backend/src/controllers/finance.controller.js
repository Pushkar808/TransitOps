const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');

// ---------- Fuel logs ----------

// GET /fuel
const listFuel = asyncHandler(async (req, res) => {
  const where = {};
  if (req.query.vehicleId) where.vehicleId = req.query.vehicleId;
  const logs = await prisma.fuelLog.findMany({
    where,
    include: { vehicle: true },
    orderBy: { date: 'desc' },
  });
  res.json(logs);
});

// POST /fuel
const createFuel = asyncHandler(async (req, res) => {
  const log = await prisma.fuelLog.create({ data: req.body, include: { vehicle: true } });
  res.status(201).json(log);
});

// ---------- Expenses ----------

// GET /expenses
const listExpenses = asyncHandler(async (req, res) => {
  const where = {};
  if (req.query.vehicleId) where.vehicleId = req.query.vehicleId;
  if (req.query.type) where.type = req.query.type;
  const expenses = await prisma.expense.findMany({
    where,
    include: { vehicle: true },
    orderBy: { date: 'desc' },
  });
  res.json(expenses);
});

// POST /expenses
const createExpense = asyncHandler(async (req, res) => {
  const expense = await prisma.expense.create({ data: req.body, include: { vehicle: true } });
  res.status(201).json(expense);
});

module.exports = { listFuel, createFuel, listExpenses, createExpense };
