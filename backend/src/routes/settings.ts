import { Router, Request, Response } from 'express';
import { SchoolSettings } from '../models/SchoolSettings';

const router = Router();

// Get current school settings (creates default if none exist)
router.get('/', async (_req: Request, res: Response) => {
  try {
    let settings = await SchoolSettings.findOne();
    if (!settings) {
      settings = await SchoolSettings.create({
        schoolName: 'Delhi Public School',
        schoolLocation: 'Bokaro Steel City',
        boardAffiliation: 'CBSE',
      });
    }
    return res.json(settings);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Update school settings
router.put('/', async (req: Request, res: Response) => {
  try {
    const { schoolName, schoolLocation, principalName, contactEmail, contactPhone, address, boardAffiliation } = req.body;

    if (!schoolName?.trim()) return res.status(400).json({ error: 'School name is required' });
    if (!schoolLocation?.trim()) return res.status(400).json({ error: 'School location is required' });

    let settings = await SchoolSettings.findOne();
    if (!settings) {
      settings = await SchoolSettings.create({ schoolName, schoolLocation, principalName, contactEmail, contactPhone, address, boardAffiliation });
    } else {
      settings.schoolName = schoolName.trim();
      settings.schoolLocation = schoolLocation.trim();
      if (principalName !== undefined) settings.principalName = principalName.trim();
      if (contactEmail !== undefined) settings.contactEmail = contactEmail.trim();
      if (contactPhone !== undefined) settings.contactPhone = contactPhone.trim();
      if (address !== undefined) settings.address = address.trim();
      if (boardAffiliation !== undefined) settings.boardAffiliation = boardAffiliation.trim();
      await settings.save();
    }

    return res.json(settings);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
