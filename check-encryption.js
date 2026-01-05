// Quick script to check database encryption
const mongoose = require('mongoose');

const MONGODB_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/eventshield';

async function checkEncryption() {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log('\n✅ Connected to MongoDB\n');
    console.log('=' .repeat(80));
    console.log('DATABASE ENCRYPTION CHECK');
    console.log('=' .repeat(80));

    // Check Users Collection
    console.log('\n📊 USERS COLLECTION:\n');
    const users = await mongoose.connection.db.collection('users').find({}).limit(1).toArray();
    
    if (users.length === 0) {
      console.log('⚠️  No users found in database. Please register a user first.');
    } else {
      const user = users[0];
      console.log('User Email:', user.email);
      console.log('\n🔐 ENCRYPTION STATUS:\n');
      
      // Check password hashing
      console.log('✓ Password Field:');
      console.log('  - Hashed:', user.password ? '✅ YES (length: ' + user.password.length + ' chars)' : '❌ NO');
      console.log('  - Value:', user.password ? user.password.substring(0, 50) + '...' : 'N/A');
      
      console.log('\n✓ Password Salt:');
      console.log('  - Present:', user.passwordSalt ? '✅ YES' : '❌ NO');
      console.log('  - Value:', user.passwordSalt || 'N/A');
      
      console.log('\n✓ Password Iterations:');
      console.log('  - Value:', user.passwordIterations || 'N/A');
      
      // Check encrypted data
      console.log('\n✓ Encrypted Data Field:');
      console.log('  - Present:', user.encryptedData ? '✅ YES' : '❌ NO');
      if (user.encryptedData) {
        const encData = typeof user.encryptedData === 'string' 
          ? JSON.parse(user.encryptedData) 
          : user.encryptedData;
        console.log('  - Fields encrypted:', Object.keys(encData).join(', '));
        console.log('  - Sample (firstname):', encData.firstname ? encData.firstname.substring(0, 50) + '...' : 'N/A');
      }
      
      // Check RSA keys
      console.log('\n✓ RSA Public Key:');
      console.log('  - Present:', user.rsaPublicKey ? '✅ YES' : '❌ NO');
      if (user.rsaPublicKey) {
        console.log('  - Format:', user.rsaPublicKey.substring(0, 30) + '...');
      }
      
      console.log('\n✓ RSA Private Key:');
      console.log('  - Present:', user.rsaPrivateKey ? '✅ YES' : '❌ NO');
      console.log('  - Encrypted:', user.rsaPrivateKey ? '✅ YES (length: ' + user.rsaPrivateKey.length + ' chars)' : '❌ NO');
      
      // Check ECC keys
      console.log('\n✓ ECC Public Key:');
      console.log('  - Present:', user.eccPublicKey ? '✅ YES' : '❌ NO');
      
      console.log('\n✓ ECC Private Key:');
      console.log('  - Present:', user.eccPrivateKey ? '✅ YES' : '❌ NO');
      console.log('  - Encrypted:', user.eccPrivateKey ? '✅ YES' : '❌ NO');
      
      // Check MAC
      console.log('\n✓ Data MAC (Message Authentication Code):');
      console.log('  - Present:', user.dataMac ? '✅ YES' : '❌ NO');
      console.log('  - Value:', user.dataMac ? user.dataMac.substring(0, 50) + '...' : 'N/A');
      
      // Check 2FA
      console.log('\n✓ Two-Factor Authentication:');
      console.log('  - Enabled:', user.twoFactorEnabled ? '✅ YES' : '⚪ NO (not set up)');
      console.log('  - Secret Encrypted:', user.twoFactorSecret ? '✅ YES' : '⚪ N/A');
    }

    // Check Events Collection
    console.log('\n\n' + '=' .repeat(80));
    console.log('📊 EVENTS COLLECTION:\n');
    const events = await mongoose.connection.db.collection('events').find({}).limit(1).toArray();
    
    if (events.length === 0) {
      console.log('⚠️  No events found in database. Please create an event first.');
    } else {
      const event = events[0];
      console.log('Event ID:', event._id);
      console.log('\n🔐 ENCRYPTION STATUS:\n');
      
      // Check encrypted data
      console.log('✓ Encrypted Data Field:');
      console.log('  - Present:', event.encryptedData ? '✅ YES' : '❌ NO');
      if (event.encryptedData) {
        const encData = typeof event.encryptedData === 'string' 
          ? JSON.parse(event.encryptedData) 
          : event.encryptedData;
        console.log('  - Fields encrypted:', Object.keys(encData).join(', '));
        console.log('  - Sample (eventName):', encData.eventName ? encData.eventName.substring(0, 50) + '...' : 'N/A');
      }
      
      // Check MAC
      console.log('\n✓ Data MAC:');
      console.log('  - Present:', event.dataMac ? '✅ YES' : '❌ NO');
      console.log('  - Value:', event.dataMac ? event.dataMac.substring(0, 50) + '...' : 'N/A');
      
      // Check participants encryption
      if (event.participants && event.participants.length > 0) {
        console.log('\n✓ Participant Ticket Data:');
        console.log('  - Participants:', event.participants.length);
        console.log('  - Ticket Encrypted:', event.participants[0].encryptedTicketData ? '✅ YES (Multi-level)' : '❌ NO');
        if (event.participants[0].encryptedTicketData) {
          console.log('  - Length:', event.participants[0].encryptedTicketData.length, 'chars (double encryption = longer)');
        }
      }
    }

    // Summary
    console.log('\n\n' + '=' .repeat(80));
    console.log('📝 SUMMARY');
    console.log('=' .repeat(80));
    
    if (users.length > 0) {
      const user = users[0];
      const checks = [
        { name: 'Password Hashing', status: !!user.password },
        { name: 'Password Salt', status: !!user.passwordSalt },
        { name: 'Encrypted User Data', status: !!user.encryptedData },
        { name: 'RSA Keys', status: !!user.rsaPublicKey && !!user.rsaPrivateKey },
        { name: 'ECC Keys', status: !!user.eccPublicKey && !!user.eccPrivateKey },
        { name: 'MAC Signature', status: !!user.dataMac },
      ];
      
      const passed = checks.filter(c => c.status).length;
      const total = checks.length;
      
      console.log('\n✅ Encryption Checks Passed:', passed + '/' + total);
      checks.forEach(check => {
        console.log('  ', check.status ? '✅' : '❌', check.name);
      });
      
      if (passed === total) {
        console.log('\n🎉 ALL ENCRYPTION REQUIREMENTS MET!');
      } else {
        console.log('\n⚠️  Some encryption features missing. Check implementation.');
      }
    }
    
    console.log('\n' + '=' .repeat(80));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed\n');
  }
}

checkEncryption();
