import Project from '../models/Project.js';
import eventBus from '../events/eventBus.js';
import cloudinary from '../lib/cloudinary.js';

export const uploadToCloudinary = async (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'image' },
            (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
            }
        );
        stream.end(buffer);
    });
};

export const createProject = async (projectData, files, user) => {
    let coverImageUrl = '';
    let extraImageUrls = [];

    if (files?.coverImage?.[0]) {
        coverImageUrl = await uploadToCloudinary(
            files.coverImage[0].buffer,
            'dev-canvas/projects'
        );
    }

    if (files?.extraImages?.length) {
        extraImageUrls = await Promise.all(
            files.extraImages.map((file) =>
                uploadToCloudinary(file.buffer, 'dev-canvas/projects/extras')
            )
        );
    }

    let tagsArray = [];
    if (projectData.tags) {
        tagsArray = typeof projectData.tags === 'string'
            ? projectData.tags.split(',').map((t) => t.trim()).filter(Boolean)
            : projectData.tags;
    }

    const project = new Project({
        title: projectData.title,
        description: projectData.description,
        githubUrl: projectData.githubUrl,
        demoUrl: projectData.demoUrl,
        tags: tagsArray,
        studentId: user.id,
        coverImage: coverImageUrl,
        images: extraImageUrls,
        exhibitionName: projectData.exhibitionName,
        reservationDate: projectData.reservationDate,
        stallType: projectData.stallType,
        preferredStallSize: projectData.preferredStallSize,
        numberOfStalls: projectData.numberOfStalls ? Number(projectData.numberOfStalls) : undefined,
        businessCategory: projectData.businessCategory,
    });

    await project.save();

    eventBus.emit("project:created", {
        project,
        creator: user,
    });

    return project;
};

export const getProjects = async (userId) => {
    const query = {};
    if (userId) {
        query.studentId = userId;
    }
    return await Project.find(query)
        .sort({ createdAt: -1 })
        .populate('studentId', 'name email profilePic');
};

export const getProjectById = async (projectId) => {
    const project = await Project.findById(projectId).populate('studentId', 'name email profilePic');
    if (!project) throw new Error('Project not found');
    return project;
};

export const updateProject = async (projectId, updateData, files, userId) => {
    const project = await Project.findById(projectId);
    if (!project) throw new Error('Project not found');
    if (project.studentId.toString() !== userId) throw new Error('Unauthorized');

    if (files?.coverImage?.[0]) {
        project.coverImage = await uploadToCloudinary(
            files.coverImage[0].buffer,
            'dev-canvas/projects'
        );
    }

    let updatedImages = project.images || [];
    if (updateData.existingImages !== undefined) {
        try {
            updatedImages = JSON.parse(updateData.existingImages);
        } catch (e) {
            updatedImages = Array.isArray(updateData.existingImages) ? updateData.existingImages : [updateData.existingImages];
        }
    }

    if (files?.extraImages?.length) {
        const newlyUploaded = await Promise.all(
            files.extraImages.map((file) =>
                uploadToCloudinary(file.buffer, 'dev-canvas/projects/extras')
            )
        );
        updatedImages = [...updatedImages, ...newlyUploaded];
    }
    project.images = updatedImages;

    const { title, description, githubUrl, demoUrl, tags,
        exhibitionName, reservationDate, stallType,
        preferredStallSize, numberOfStalls, businessCategory } = updateData;
    if (title) project.title = title;
    if (description) project.description = description;
    if (githubUrl !== undefined) project.githubUrl = githubUrl;
    if (demoUrl !== undefined) project.demoUrl = demoUrl;
    if (tags !== undefined) {
        project.tags = typeof tags === 'string'
            ? tags.split(',').map((t) => t.trim()).filter(Boolean)
            : tags;
    }
    if (exhibitionName !== undefined) project.exhibitionName = exhibitionName;
    if (reservationDate !== undefined) project.reservationDate = reservationDate;
    if (stallType !== undefined) project.stallType = stallType;
    if (preferredStallSize !== undefined) project.preferredStallSize = preferredStallSize;
    if (numberOfStalls !== undefined) project.numberOfStalls = Number(numberOfStalls);
    if (businessCategory !== undefined) project.businessCategory = businessCategory;

    await project.save();
    return project;
};

export const deleteProject = async (projectId, userId) => {
    const project = await Project.findById(projectId);
    if (!project) throw new Error('Project not found');
    if (project.studentId.toString() !== userId) throw new Error('Unauthorized');

    await project.deleteOne();
    return { message: 'Project deleted' };
};
