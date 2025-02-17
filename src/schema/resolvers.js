const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Employee = require("../models/Employee");

const resolvers = {
  Query: {
    login: async (_, { username, email, password }) => {
      try {
        const user = await User.findOne({ $or: [{ username }, { email }] });
        if (!user) throw new Error("User not found");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error("Invalid credentials");

        // Generate JWT Token with more user details
        const token = jwt.sign(
          { id: user.id, username: user.username, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        return token;
      } catch (error) {
        throw new Error(error.message);
      }
    },

    getAllEmployees: async () => {
      try {
        return await Employee.find();
      } catch (error) {
        throw new Error("Error fetching employees");
      }
    },

    searchEmployeeByEid: async (_, { eid }) => {
      try {
        const employee = await Employee.findById(eid);
        if (!employee) throw new Error("Employee not found");
        return employee;
      } catch (error) {
        throw new Error("Invalid Employee ID");
      }
    },

    searchEmployeeByDesignationOrDepartment: async (
      _,
      { designation, department }
    ) => {
      try {
        return await Employee.find({ $or: [{ designation }, { department }] });
      } catch (error) {
        throw new Error("Error fetching employees by criteria");
      }
    },
  },

  Mutation: {
    signup: async (_, { username, email, password }) => {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) throw new Error("Email already registered");

        // Hash password and save user
        const hashedPassword = await bcrypt.hash(password, 10);
        await new User({ username, email, password: hashedPassword }).save();

        return "User created successfully";
      } catch (error) {
        throw new Error(error.message);
      }
    },

    addNewEmployee: async (_, args) => {
      try {
        console.log("Received Employee Data:", args);
        const existingEmployee = await Employee.findOne({ email: args.email });
        if (existingEmployee)
          throw new Error("Employee with this email already exists");
        return await new Employee(args).save();
        const newEmployee = new Employee(args);
        await newEmployee.save();

        console.log("Employee Added Successfully:", newEmployee); // Debugging log
        return newEmployee;
      } catch (error) {
        throw new Error("Error adding employee");
      }
    },

    updateEmployeeByEid: async (_, { eid, ...updates }) => {
      try {
        const updatedEmployee = await Employee.findByIdAndUpdate(eid, updates, {
          new: true,
        });
        if (!updatedEmployee) throw new Error("Employee not found");
        return updatedEmployee;
      } catch (error) {
        throw new Error("Error updating employee");
      }
    },

    deleteEmployeeByEid: async (_, { eid }) => {
      try {
        const deletedEmployee = await Employee.findByIdAndDelete(eid);
        if (!deletedEmployee) throw new Error("Employee not found");
        return "Employee deleted successfully";
      } catch (error) {
        throw new Error("Error deleting employee");
      }
    },
  },
};

module.exports = resolvers;
