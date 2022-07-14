const PostCategory = (sequelize, DataTypes) => {
  const PostCategory = sequelize.define(
    "PostCategory",
    {
      postId: { type: DataTypes.INTEGER, foreignKey: true },
      categoryId: { type: DataTypes.INTEGER, foreignKey: true },
    },
    {
      timestamps: false,
    }
  );

  PostCategory.associate = (models) => {
    models.BlogPost.belongsToMany(models.Category, {
      as: 'categories',
      through: PostCategory,
      foreignKey: 'id',
      otherKey: 'id',
    });
    models.Category.belongsToMany(models.BlogPost, {
      as: 'posts',
      through: PostCategory,
      foreignKey: 'id',
      otherKey: 'id',
    })
  };

  return PostCategory;
};

module.exports = PostCategory;
