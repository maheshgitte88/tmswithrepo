const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const SubDepartment = require('../models/SubDepartment');
const QueryCategory = require('../models/QueryCategory');
const QuerySubcategory = require('../models/QuerySubcategory');

// Function to get departments with hierarchy
async function getDepartmentsWithHierarchy() {
  try {
    const departments = await Department.findAll({
      include: [
        {
          model: SubDepartment,
          as: 'SubDepartments',
          include: [
            {
              model: QueryCategory,
              as: 'QueryCategories'
            }
          ]
        },
        {
          model: QueryCategory,
          as: 'QueryCategories'
        }
      ]
    });
    return departments;
  } catch (error) {
    console.error('Error fetching departments with hierarchy:', error);
    throw error;
  }
}

// API endpoint to get departments with hierarchy
router.get('/departments-hierarchy', async (req, res) => {
  try {
    const departments = await getDepartmentsWithHierarchy();
    res.status(200).json({ success: true, departments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


// Function to get departments with sub-departments
async function getDepSubsWithHierarchy() {
    try {
      const departments = await Department.findAll({
        attributes: ['DepartmentID', 'DepartmentName'],
        include: [
          {
            model: SubDepartment,
            as: 'SubDepartments',
            attributes: ['SubDepartmentID', 'SubDepartmentName', 'DepartmentId'],

          }
        ]
      });
      return departments;
    } catch (error) {
      console.error('Error fetching departments with hierarchy:', error);
      throw error;
    }
  }
  
  // API endpoint to get departments with sub-departments
  router.get('/dep-sub-hierarchy', async (req, res) => {
    try {
      const departments = await getDepSubsWithHierarchy();
      res.status(200).json({ success: true, departments });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });


  router.get('/mis-hierarchy', async (req, res) => {
    try {
      const data = await QueryCategory.findAll({
        where: { DepartmentID: 1 ,SubDepartmentID: 4 },
        attributes: ['QueryCategoryID', 'QueryCategoryName'],
        include: {
          model: QuerySubcategory,
          attributes: ['QuerySubCategoryID', 'QuerySubcategoryName', 'TimeInMinutes'],
        },
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


router.get('/all-hierarchy', async (req, res) => {
    try {
      const departments = await Department.findAll({
        attributes: ['DepartmentID', 'DepartmentName'], // Include only necessary attributes
        include: {
          model: SubDepartment,
          attributes: ['SubDepartmentID', 'SubDepartmentName'], // Include only necessary attributes
          include: {
            model: QueryCategory,
            attributes: ['QueryCategoryID', 'QueryCategoryName'], // Include only necessary attributes
            include: {
              model: QuerySubcategory,
              attributes: ['QuerySubCategoryID', 'QuerySubcategoryName', 'TimeInMinutes'], // Include only necessary attributes
            },
          },
        },
      });
  
      res.json(departments);
    } catch (error) {
      console.error('Error fetching ticket data:', error);
      res.status(500).json({ error: 'An error occurred while fetching ticket data' });
    }
  });

module.exports = router;
