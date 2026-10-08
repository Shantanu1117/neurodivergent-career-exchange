import { Request, Response } from 'express';
import { Resource } from '../models/Resource.js';

export class ResourceController {
  public static async getResources(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.query;
      const filter: any = {};
      if (category && category !== 'ALL') {
        filter.category = category;
      }

      const resources = await Resource.find(filter).sort({ featured: -1, createdAt: -1 });
      res.json({ success: true, resources });
    } catch (err: any) {
      console.error('getResources error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve resources.' });
    }
  }

  public static async getResourceBySlug(req: Request, res: Response): Promise<void> {
    try {
      const resource = await Resource.findOne({ slug: req.params.slug });
      if (!resource) {
        res.status(404).json({ success: false, message: 'Resource not found.' });
        return;
      }
      res.json({ success: true, resource });
    } catch (err: any) {
      console.error('getResourceBySlug error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve resource.' });
    }
  }

  public static async createResource(req: Request, res: Response): Promise<void> {
    try {
      const resource = await Resource.create(req.body);
      res.status(201).json({ success: true, resource });
    } catch (err: any) {
      console.error('createResource error:', err);
      res.status(500).json({ success: false, message: 'Failed to create resource.' });
    }
  }

  public static async deleteResource(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const resource = await Resource.findByIdAndDelete(id);
      if (!resource) {
        res.status(404).json({ success: false, message: 'Resource not found.' });
        return;
      }
      res.json({ success: true, message: 'Resource deleted.' });
    } catch (err: any) {
      console.error('deleteResource error:', err);
      res.status(500).json({ success: false, message: 'Failed to delete resource.' });
    }
  }
}
