const express = require("express");
const Category = require("../models/ProActive/category");
const SubCategory = require("../models/ProActive/SubCategory");
const WorkDetail = require("../models/ProActive/WorkDetail");
const Department = require("../models/Department");
const router = express.Router();
// Create a new category
router.post("/categories", async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new subcategory
router.post("/subcategories", async (req, res) => {
  try {
    const subCategory = await SubCategory.create(req.body);
    res.status(201).json(subCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get subcategories by category ID
router.get("/subcategories/:categoryId", async (req, res) => {
  try {
    const subcategories = await SubCategory.findAll({
      where: { categoryId: req.params.categoryId },
    });
    res.status(200).json(subcategories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new work detail
router.post("/workdetails", async (req, res) => {
  try {
    const workDetail = await WorkDetail.create(req.body);
    res.status(201).json(workDetail);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all departments (mock API)
router.get("/departments", async (req, res) => {
    try {
      const departments = await Department.findAll({
        attributes: ["DepartmentName"],
      });
      const departmentNames = departments.map(department => department.DepartmentName);
      res.status(200).json(departmentNames);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

module.exports = router;
