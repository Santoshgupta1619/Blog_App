import { useEffect, useState } from "react";
import {
  getCategories,
  createCategory,
  deleteCategory,
} from "../../api/categoryApi";


const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async () => {
    if (!name.trim()) {
      return alert("Enter category name");
    }

    try {
      setLoading(true);

      await createCategory(name);

      setName("");

      fetchCategories();

      alert("Category added successfully");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Delete this category?"
    );

    if (!confirmDelete) return;

    try {
      await deleteCategory(id);

      fetchCategories();

      alert("Category deleted");
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed");
    }
  };

  return (
    <div className="container mt-4">

      <h2 className="mb-4">
        Categories
      </h2>

      <div className="card p-3 mb-4">

        <div className="d-flex gap-2">

          <input
            className="form-control"
            placeholder="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button
            className="btn btn-primary"
            onClick={handleAdd}
            disabled={loading}
          >
            {loading ? "Adding..." : "Add"}
          </button>

        </div>

      </div>

      <div className="card">

        <table className="table mb-0">

          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th width="120">Action</th>
            </tr>
          </thead>

          <tbody>

            {categories.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center">
                  No categories found
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.id}</td>

                  <td>{category.name}</td>

                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        handleDelete(category.id)
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default Categories;