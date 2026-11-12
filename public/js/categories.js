function editCategory(id, name, description) {

    const modal = document.getElementById("editModal");

    const editForm = document.getElementById("editForm");

    document.getElementById("editName").value = name;

    document.getElementById("editDescription").value = description;

    editForm.action = `/admin/categories/edit/${id}`;

    modal.style.display = "flex";
}


function closeModal() {

    document.getElementById("editModal").style.display = "none";

}