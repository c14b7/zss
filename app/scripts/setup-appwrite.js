// Setup script for Appwrite database structure
// Run with: node scripts/setup-appwrite.js

const { Client, Databases, Storage, Permission, Role } = require('appwrite');

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')  // Your Appwrite Endpoint
    .setProject('687abe96000d2d31f914')  // Your project ID
    .setKey('YOUR_API_KEY');  // Your secret API key

const databases = new Databases(client);
const storage = new Storage(client);

async function setupAppwrite() {
    try {
        console.log('🚀 Starting Appwrite setup...');

        // 1. Create database (if not exists)
        try {
            await databases.get('votes');
            console.log('✅ Database "votes" already exists');
        } catch (error) {
            if (error.code === 404) {
                await databases.create('votes', 'Votes and Documents');
                console.log('✅ Created database "votes"');
            } else {
                throw error;
            }
        }

        // 2. Create documents collection
        try {
            await databases.getCollection('votes', 'documents');
            console.log('✅ Collection "documents" already exists');
        } catch (error) {
            if (error.code === 404) {
                await databases.createCollection(
                    'votes',
                    'documents', 
                    'Documents',
                    [
                        Permission.create(Role.users()),
                        Permission.read(Role.users()),
                        Permission.update(Role.users()),
                        Permission.delete(Role.users())
                    ]
                );
                console.log('✅ Created collection "documents"');

                // Create attributes
                const attributes = [
                    { key: 'title', type: 'string', size: 255, required: true },
                    { key: 'type', type: 'string', size: 20, required: true, default: 'text' },
                    { key: 'content', type: 'string', size: 1000000, required: false },
                    { key: 'fileId', type: 'string', size: 255, required: false },
                    { key: 'fileName', type: 'string', size: 255, required: false },
                    { key: 'fileSize', type: 'integer', required: false, default: 0 },
                    { key: 'mimeType', type: 'string', size: 100, required: false },
                    { key: 'visibility', type: 'string', size: 20, required: true, default: 'private' },
                    { key: 'sharedWith', type: 'string', size: 255, required: false, array: true },
                    { key: 'tags', type: 'string', size: 100, required: false, array: true },
                    { key: 'createdBy', type: 'string', size: 255, required: true }
                ];

                for (const attr of attributes) {
                    try {
                        if (attr.type === 'string') {
                            await databases.createStringAttribute(
                                'votes',
                                'documents',
                                attr.key,
                                attr.size,
                                attr.required,
                                attr.default,
                                attr.array || false
                            );
                        } else if (attr.type === 'integer') {
                            await databases.createIntegerAttribute(
                                'votes',
                                'documents', 
                                attr.key,
                                attr.required,
                                undefined,
                                undefined,
                                attr.default
                            );
                        }
                        console.log(`✅ Created attribute "${attr.key}"`);
                        
                        // Wait a bit between requests
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } catch (error) {
                        console.error(`❌ Error creating attribute "${attr.key}":`, error.message);
                    }
                }

                // Create indexes (after attributes are created)
                console.log('⏳ Waiting for attributes to be ready...');
                await new Promise(resolve => setTimeout(resolve, 5000));

                const indexes = [
                    { key: 'createdBy_visibility', type: 'key', attributes: ['createdBy', 'visibility'] },
                    { key: 'visibility_public', type: 'key', attributes: ['visibility'] },
                    { key: 'tags_search', type: 'fulltext', attributes: ['tags'] },
                    { key: 'title_search', type: 'fulltext', attributes: ['title'] }
                ];

                for (const index of indexes) {
                    try {
                        await databases.createIndex(
                            'votes',
                            'documents',
                            index.key,
                            index.type,
                            index.attributes
                        );
                        console.log(`✅ Created index "${index.key}"`);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } catch (error) {
                        console.error(`❌ Error creating index "${index.key}":`, error.message);
                    }
                }
            } else {
                throw error;
            }
        }

        // 3. Create storage bucket
        try {
            await storage.getBucket('documents-files');
            console.log('✅ Bucket "documents-files" already exists');
        } catch (error) {
            if (error.code === 404) {
                await storage.createBucket(
                    'documents-files',
                    'Document Files',
                    [
                        Permission.create(Role.users()),
                        Permission.read(Role.users()),
                        Permission.update(Role.users()),
                        Permission.delete(Role.users())
                    ],
                    false, // fileSecurity
                    true,  // enabled
                    10485760, // maxFileSize (10MB)
                    ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'gif', 'svg', 'zip', 'rar', '7z'], // allowedFileExtensions
                    'gzip', // compression
                    true,   // encryption
                    true    // antivirus
                );
                console.log('✅ Created bucket "documents-files"');
            } else {
                throw error;
            }
        }

        console.log('🎉 Appwrite setup completed successfully!');
        
    } catch (error) {
        console.error('❌ Setup failed:', error);
    }
}

// Run setup
setupAppwrite();
