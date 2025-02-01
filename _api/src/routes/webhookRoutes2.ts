import { type UserJSON } from '@clerk/express';
import { type Request, type Response, Router } from 'express';
import { Webhook } from 'svix';

import { addUser } from '../models/userRepo';

const router = Router();

// Webhook request type
// type WebhookRequest = Request & { rawBody?: Buffer };

// Clerk webhook event types
// type UserData = {
//   id: string;
//   email_addresses: {
//     email_address_id: string;
//     to_email_address: string;
//   }[];
//   user_id: string;
//   data;
// };

type WebhookEvent = {
  data: any;
  object: string;
  type: string;
};

router.get('/', (_req: Request, res: Response) => {
  console.log('I Got the thing');
  res.json({ status: 'OK' });
});

router.post('/', async (req, res: Response) => {
  const body = req.body as WebhookEvent;
  console.log('Webhook received TYPED:', body);
  try {
    console.log('got webook 2');
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
      throw new Error('Missing CLERK_WEBHOOK_SECRET');
    }

    console.log('Verifying headers ...');

    const headers = req.headers;

    // Get the headers
    const svix_id = headers['svix-id'] as string;
    const svix_timestamp = headers['svix-timestamp'] as string;
    const svix_signature = headers['svix-signature'] as string;

    console.log('Found headers');

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res.status(400).json({ error: 'Missing webhook headers' });
    }

    // Create a new Svix instance with your secret
    console.log('Creating webhook verification object');
    const wh = new Webhook(WEBHOOK_SECRET);
    try {
      console.log('Verifying webhook signature');
      wh.verify(JSON.stringify(body) || '{}', {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      });
    } catch (err) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    console.log('doing the switch statement');

    // Handle different webhook events
    switch (body.type) {
      case 'user.created': {
        console.log('User updated:', body.data);
        const rawUserData = body.data as UserJSON;
        const emailAddress = rawUserData.email_addresses[0].email_address;
        console.log('Email Address:', emailAddress);

        await addUser(rawUserData.id, emailAddress, {
          firstName: rawUserData.first_name,
          lastName: rawUserData.last_name,
        });
        break;
      }

      case 'user.deleted': {
        console.log('User deleted:', body.data.id);
        // const primaryEmail = body.data.email_addresses.find(
        //   (email) => email.id === body.data.primary_email_address_id
        // )?.email_address;

        // if (primaryEmail) {
        //   await prisma.user.delete({
        //     where: { email: primaryEmail },
        //   });
        // }
        break;
      }
    }

    console.log('step 5 return success');

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Error processing webhook' });
  }
});

export default router;
