const { z, requiredText, optionalText } = require('./common');

// Entrada: POST /api/technologies
const CreateTechnologyInput = z
  .object({
    name: requiredText('name', 60),
    category: optionalText('category', 60),
  })
  .strict();

const toTechnologyOutput = (row) => ({
  id: row.id,
  name: row.name,
  category: row.category,
});

module.exports = { CreateTechnologyInput, toTechnologyOutput };
