import { Job } from "../models/job.model.js";

// admin
export const postJob = async (req, res) => {
    try {
        const { title, description, requirements, location, salary, jobType, experience, position, companyId } = req.body;
        const userId = req.id
        if ([title, description, requirements, location, salary, jobType, experience, position, companyId].some((field) => typeof field === 'string' && field.trim() === "")) {
            return res.status(400).json({ error: "something is missing" });
        }
        const job = await Job.create({
            title,
            description,
            requirements: requirements.split(","),
            location,
            salary: Number(salary),
            jobType,
            experienceLevel: experience,
            position,
            company: companyId,
            created_by: userId
        });
        return res.status(201).json({
            message: "Job created successfully",
            success: true,
            job
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
// student
export const getAllJobs = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const query = {
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },

            ]
        }
        const jobs = await Job.find(query).populate({
            path: "company",

        }).sort({ createdAt: -1 })

        if (!jobs) {
            return res.status(404).json({
                message: "No jobs found",
                success: false
            })
        }

        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
// student
export const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            });
        }
        return res.status(200).json({
            job,
            success: true
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// admin
export const getAdminJobs = async (req, res) => {
    try {
        const adminId = req.id
        const jobs = await Job.find({ created_by: adminId });
        if (!jobs) {
            return res.status(404).json({
                message: "No jobs found",
                success: false
            });
        }
        return res.status(200).json({
            jobs,
            success: true
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
