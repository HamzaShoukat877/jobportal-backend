import { Company } from "../models/company.model.js";
import cloudinary from "../utlils/cloudinary.js";
import getDataUri from "../utlils/datauri.js";

export const registerCompany = async (req, res) => {
    try {

        const { companyName } = req.body

        if (!companyName) {
            return res.status(400).json({
                message: "Company name is required",
                success: false
            });
        }

        let company = await Company.findOne({
            name: companyName,
        })
        if (company) {
            return res.status(400).json({
                message: "Company already exists",
                success: false
            });
        }

        company = await Company.create({
            name: companyName,
            userId: req.id
        })

        return res.status(200).json({
            message: "Company registered successfully",
            success: true,
            company
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

export const getCompany = async (req, res) => {
    try {
        const userId = req.id
        const companies = await Company.find({ userId })

        if (!companies) {
            return res.status(400).json({
                message: "No companies found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Companies fetched successfully",
            success: true,
            companies
        })
    } catch (error) {
        console.log(error)
    }
}

export const getCompanyById = async (req, res) => {
    try {

        const companyId = req.params.id
        const company = await Company.findById(companyId)

        if (!company) {
            return res.status(404).json({
                message: "Company not found",
                success: false
            });
        }

        return res.status(200).json({
            success: true,
            company
        });
    } catch (error) {
        console.log(error)
    }
}

export const updateCompany = async (req, res) => {
    try {
        const { name, description, website, location } = req.body
        const file = req.file

        if (!file) {
            return res.status(400).json({
                message: "Logo is required",
                success: false
            });
        }

        const fileUri = getDataUri(file)
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content)
        const logo = cloudResponse.secure_url


        const updateData = {
            name,
            description,
            website,
            location,
            logo
        }

        const company = await Company.findByIdAndUpdate(req.params.id, updateData, { new: true })

        if (!company) {
            return res.status(404).json({
                message: "Company not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Company updated successfully",
            success: true,
        });
    } catch (error) {
        console.log(error)
    }
}