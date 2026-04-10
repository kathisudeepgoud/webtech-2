const crypto = require('crypto');
const { getSession } = require('./connection');

const createUser = async (name, age, interest = null) => {
  const session = getSession();
  try {
    const id = crypto.randomUUID();
    const result = await session.run(
      'CREATE (u:User {id: $id, name: $name, age: $age, interest: $interest, searchName: toLower($name)}) RETURN u',
      { id, name, age: Number(age), interest: interest || null }
    );
    return result.records[0].get('u').properties;
  } finally {
    await session.close();
  }
};

const deleteUser = async (name) => {
  const session = getSession();
  try {
    // case insensitive matching by converting the input to lowercase and matching with searchName
    const result = await session.run(
      'MATCH (u:User) WHERE toLower(u.name) = toLower($name) DETACH DELETE u RETURN u',
      { name }
    );
    if (result.records.length === 0) {
      throw new Error('User not found');
    }
    return result.records[0].get('u').properties;
  } finally {
    await session.close();
  }
};

const updateUser = async (name, newAge, newInterest) => {
  const session = getSession();
  try {
    const result = await session.run(
      `MATCH (u:User) 
       WHERE toLower(u.name) = toLower($name)
       SET u.age = $newAge, u.interest = $newInterest
       RETURN u`,
      { name, newAge: Number(newAge), newInterest: newInterest || null }
    );
    if (result.records.length === 0) {
      throw new Error('User not found');
    }
    return result.records[0].get('u').properties;
  } finally {
    await session.close();
  }
};

module.exports = {
  createUser,
  deleteUser,
  updateUser
};
