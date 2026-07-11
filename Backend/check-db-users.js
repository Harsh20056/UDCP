const { User } = require('./src/models');

async function check() {
  try {
    const users = await User.findAll({ attributes: ['email', 'role', 'department'] });
    console.log('\n--- Users in Database ---');
    users.forEach(u => {
      console.log(`- ${u.email} (${u.role}) [Dept: ${u.department}]`);
    });
    console.log('-------------------------\n');
    process.exit(0);
  } catch (err) {
    console.error('Error querying users:', err);
    process.exit(1);
  }
}

check();
