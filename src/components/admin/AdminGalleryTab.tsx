"use client";

import React, { useState } from "react";
import {
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  X,
  Save,
  Upload,
} from "lucide-react";

import type { GalleryImage } from "@/types";
import { useToast } from "@/components/Toast";
import { createClient } from "@/utils/supabase/client";

interface AdminGalleryTabProps {
  gallery: GalleryImage[];
  onSaveGallery: (updated: GalleryImage[]) => void;
}

export const AdminGalleryTab: React.FC<AdminGalleryTabProps> = ({
  gallery,
  onSaveGallery,
}) => {
  const { showToast } = useToast();
  const supabase = createClient();

  const [editingImage, setEditingImage] =
    useState<GalleryImage | null>(null);

  const [isAdding, setIsAdding] = useState(false);

  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("Mixology");
  const [caption, setCaption] = useState("");
  const [altText, setAltText] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // ============================================================
  // RESET FORM
  // ============================================================

  const resetForm = () => {
    setUrl("");
    setCategory("Mixology");
    setCaption("");
    setAltText("");
    setIsActive(true);

    setEditingImage(null);
    setIsAdding(false);
  };

  // ============================================================
  // OPEN ADD
  // ============================================================

  const handleOpenAdd = () => {
    resetForm();
    setIsAdding(true);
  };

  // ============================================================
  // OPEN EDIT
  // ============================================================

  const handleOpenEdit = (img: GalleryImage) => {
    setEditingImage(img);

    setUrl(img.url || "");
    setCategory(img.category || "Mixology");
    setCaption(img.caption || "");
    setAltText(img.alt_text || "");
    setIsActive(Boolean(img.is_active));

    setIsAdding(false);
  };

  // ============================================================
  // IMAGE TO BASE64
  // ============================================================

  const handleBase64 = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      showToast(
        "Image too large. Maximum size is 1.5 MB.",
        "error"
      );

      e.target.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      showToast(
        "Please select a valid image file.",
        "error"
      );

      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setUrl(String(reader.result || ""));

      showToast(
        "Image loaded successfully",
        "success"
      );
    };

    reader.onerror = () => {
      showToast(
        "Unable to read image",
        "error"
      );
    };

    reader.readAsDataURL(file);
  };

  // ============================================================
  // SAVE - ADD / EDIT
  // ============================================================

  const handleSave = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!url.trim()) {
      showToast(
        "Image URL or image is required",
        "error"
      );
      return;
    }

    if (!category.trim()) {
      showToast(
        "Category is required",
        "error"
      );
      return;
    }

    setIsSaving(true);

    try {
      // ========================================================
      // ADD NEW IMAGE
      // ========================================================

      if (isAdding) {
        const newId =
          typeof crypto !== "undefined" &&
          typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `img-${Date.now()}`;

        const newImage: GalleryImage = {
          id: newId,
          url: url.trim(),
          category: category.trim(),
          caption: caption.trim(),
          alt_text: altText.trim(),
          display_order: gallery.length + 1,
          is_active: isActive,
          created_at: new Date().toISOString(),
        };

        // FIRST DATABASE
        const { error } = await supabase
          .from("gallery")
          .insert({
            id: newImage.id,
            url: newImage.url,
            category: newImage.category,
            caption: newImage.caption,
            alt_text: newImage.alt_text,
            display_order: newImage.display_order,
            is_active: newImage.is_active,
            created_at: newImage.created_at,
          });

        if (error) {
          throw error;
        }

        // ONLY AFTER DB SUCCESS
        onSaveGallery([
          ...gallery,
          newImage,
        ]);

        showToast(
          "Photo added successfully",
          "success"
        );

        resetForm();
        return;
      }

      // ========================================================
      // UPDATE EXISTING IMAGE
      // ========================================================

      if (editingImage) {
        const updatedImage: GalleryImage = {
          ...editingImage,
          url: url.trim(),
          category: category.trim(),
          caption: caption.trim(),
          alt_text: altText.trim(),
          is_active: isActive,
        };

        // FIRST DATABASE
        const { error } = await supabase
          .from("gallery")
          .update({
            url: updatedImage.url,
            category: updatedImage.category,
            caption: updatedImage.caption,
            alt_text: updatedImage.alt_text,
            is_active: updatedImage.is_active,
          })
          .eq("id", editingImage.id);

        if (error) {
          throw error;
        }

        // ONLY AFTER DB SUCCESS
        const updatedGallery =
          gallery.map((item) =>
            item.id === editingImage.id
              ? updatedImage
              : item
          );

        onSaveGallery(updatedGallery);

        showToast(
          "Photo updated successfully",
          "success"
        );

        resetForm();
      }
    } catch (error) {
      console.error(
        "Gallery save error:",
        error
      );

      showToast(
        error instanceof Error
          ? `Save failed: ${error.message}`
          : "Save failed",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================
  // DELETE FROM SUPABASE
  // ============================================================

  const handleDelete = async (
    img: GalleryImage
  ) => {
    const confirmed = window.confirm(
      `Delete this photo permanently?\n\n${
        img.caption ||
        img.category ||
        "Gallery photo"
      }`
    );

    if (!confirmed) return;

    setDeletingId(img.id);

    try {
      // ========================================================
      // DELETE ACTUAL DATABASE RECORD
      // ========================================================

      const { error } = await supabase
        .from("gallery")
        .delete()
        .eq("id", img.id);

      if (error) {
        throw error;
      }

      // ========================================================
      // UPDATE LOCAL UI ONLY AFTER DB SUCCESS
      // ========================================================

      const updatedGallery =
        gallery.filter(
          (item) => item.id !== img.id
        );

      onSaveGallery(updatedGallery);

      showToast(
        "Photo deleted successfully",
        "success"
      );
    } catch (error) {
      console.error(
        "Gallery delete error:",
        error
      );

      showToast(
        error instanceof Error
          ? `Delete failed: ${error.message}`
          : "Delete failed",
        "error"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ============================================================
  // HIDE / SHOW - SUPABASE
  // ============================================================

  const toggleStatus = async (
    img: GalleryImage
  ) => {
    const newStatus = !img.is_active;

    setUpdatingId(img.id);

    try {
      // DATABASE UPDATE FIRST
      const { error } = await supabase
        .from("gallery")
        .update({
          is_active: newStatus,
        })
        .eq("id", img.id);

      if (error) {
        throw error;
      }

      // LOCAL UI AFTER SUCCESS
      const updatedGallery =
        gallery.map((item) =>
          item.id === img.id
            ? {
                ...item,
                is_active: newStatus,
              }
            : item
        );

      onSaveGallery(updatedGallery);

      showToast(
        newStatus
          ? "Photo is now visible"
          : "Photo hidden",
        "success"
      );
    } catch (error) {
      console.error(
        "Gallery status error:",
        error
      );

      showToast(
        error instanceof Error
          ? `Status update failed: ${error.message}`
          : "Status update failed",
        "error"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ============================================================
  // ADD / EDIT FORM
  // ============================================================

  if (isAdding || editingImage) {
    return (
      <div className="space-y-5">
        {/* HEADER */}

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isAdding
                ? "Add Gallery Photo"
                : "Edit Gallery Photo"}
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              Manage image, category, caption and visibility.
            </p>
          </div>

          <button
            type="button"
            onClick={resetForm}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <X size={17} />
          </button>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSave}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5"
        >
          {/* UPLOAD */}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Upload Image
            </label>

            <label className="flex items-center justify-center gap-2 h-11 px-4 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition">
              <Upload
                size={16}
                className="text-slate-500"
              />

              <span className="text-xs font-medium text-slate-600">
                Choose image from computer
              </span>

              <input
                type="file"
                accept="image/*"
                onChange={handleBase64}
                className="hidden"
              />
            </label>

            <p className="text-[10px] text-slate-400 mt-1.5">
              Maximum image size: 1.5 MB
            </p>
          </div>

          {/* PREVIEW */}

          {url && (
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
              <div className="px-3 py-2 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase">
                Preview
              </div>

              <div className="p-3 flex justify-center">
                <img
                  src={url}
                  alt={
                    altText ||
                    caption ||
                    "Gallery preview"
                  }
                  className="max-h-56 max-w-full rounded-lg object-contain"
                />
              </div>
            </div>
          )}

          {/* URL */}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Image URL / Base64 *
            </label>

            <input
              type="text"
              required
              value={url}
              onChange={(e) =>
                setUrl(e.target.value)
              }
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400"
            />
          </div>

          {/* CATEGORY */}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Category *
            </label>

            <select
              required
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400"
            >
              <option value="Mixology">
                Mixology
              </option>

              <option value="Flair">
                Flair
              </option>

              <option value="Barista">
                Barista
              </option>

              <option value="Campus Events">
                Campus Events
              </option>
            </select>
          </div>

          {/* ALT TEXT */}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Alt Text
            </label>

            <input
              type="text"
              value={altText}
              onChange={(e) =>
                setAltText(e.target.value)
              }
              placeholder="Describe this image"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400"
            />
          </div>

          {/* CAPTION */}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Caption
            </label>

            <input
              type="text"
              value={caption}
              onChange={(e) =>
                setCaption(e.target.value)
              }
              placeholder="Enter gallery caption"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400"
            />
          </div>

          {/* VISIBILITY */}

          <label className="flex items-center justify-between border border-slate-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-slate-50">
            <div>
              <p className="text-xs font-semibold text-slate-700">
                Visible on website
              </p>

              <p className="text-[10px] text-slate-400 mt-0.5">
                Hidden photos won't appear in public gallery.
              </p>
            </div>

            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) =>
                setIsActive(e.target.checked)
              }
              className="h-4 w-4 accent-orange-600"
            />
          </label>

          {/* BUTTONS */}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <X size={14} />
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isSaving ||
                !url.trim() ||
                !category.trim()
              }
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={14} />

              {isSaving
                ? "Saving..."
                : isAdding
                ? "Add Photo"
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ============================================================
  // GALLERY LIST
  // ============================================================

  return (
    <div className="space-y-5">
      {/* HEADER */}

      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Media Gallery
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            Manage photos, categories and visibility.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-sm"
        >
          <PlusCircle size={16} />
          Add Photo
        </button>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">
            Total
          </p>

          <p className="text-xl font-bold text-slate-900 mt-1">
            {gallery.length}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
          <p className="text-[10px] text-emerald-600 uppercase font-semibold">
            Visible
          </p>

          <p className="text-xl font-bold text-emerald-700 mt-1">
            {
              gallery.filter(
                (img) => img.is_active
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">
            Hidden
          </p>

          <p className="text-xl font-bold text-slate-600 mt-1">
            {
              gallery.filter(
                (img) => !img.is_active
              ).length
            }
          </p>
        </div>
      </div>

      {/* EMPTY */}

      {gallery.length === 0 ? (
        <div className="border border-dashed border-slate-300 rounded-2xl p-10 text-center bg-white">
          <div className="w-12 h-12 mx-auto rounded-full bg-orange-50 flex items-center justify-center">
            <ImageIcon
              size={22}
              className="text-orange-600"
            />
          </div>

          <h3 className="mt-3 text-sm font-semibold text-slate-800">
            No gallery photos
          </h3>

          <p className="text-xs text-slate-400 mt-1">
            Add your first photo to the gallery.
          </p>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-semibold"
          >
            <PlusCircle size={14} />
            Add Photo
          </button>
        </div>
      ) : (
        // ======================================================
        // GRID
        // ======================================================

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gallery.map((img) => (
            <div
              key={img.id}
              className={`group bg-white border rounded-2xl overflow-hidden shadow-sm transition hover:shadow-md ${
                img.is_active
                  ? "border-slate-200"
                  : "border-slate-200 opacity-70"
              }`}
            >
              {/* IMAGE */}

              <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                <img
                  src={img.url}
                  alt={
                    img.alt_text ||
                    img.caption ||
                    "Gallery image"
                  }
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  loading="lazy"
                />

                {/* CATEGORY */}

                <div className="absolute top-2 left-2">
                  <span className="inline-flex px-2 py-1 rounded-lg bg-white/90 backdrop-blur text-[10px] font-bold text-slate-700 shadow-sm">
                    {img.category}
                  </span>
                </div>

                {/* STATUS */}

                <div className="absolute top-2 right-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold backdrop-blur ${
                      img.is_active
                        ? "bg-emerald-100/95 text-emerald-700"
                        : "bg-slate-100/95 text-slate-500"
                    }`}
                  >
                    {img.is_active ? (
                      <>
                        <Eye size={11} />
                        Visible
                      </>
                    ) : (
                      <>
                        <EyeOff size={11} />
                        Hidden
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* CONTENT */}

              <div className="p-3">
                <h3 className="text-xs font-semibold text-slate-800 truncate">
                  {img.caption ||
                    "Untitled photo"}
                </h3>

                <p className="text-[10px] text-slate-400 mt-1 truncate">
                  {img.alt_text ||
                    "No alt text"}
                </p>

                {/* ACTIONS */}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  {/* TOGGLE */}

                  <button
                    type="button"
                    onClick={() =>
                      toggleStatus(img)
                    }
                    disabled={
                      updatingId === img.id
                    }
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold disabled:opacity-50 ${
                      img.is_active
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {updatingId === img.id ? (
                      "Updating..."
                    ) : img.is_active ? (
                      <>
                        <Eye size={12} />
                        Hide
                      </>
                    ) : (
                      <>
                        <EyeOff size={12} />
                        Show
                      </>
                    )}
                  </button>

                  {/* EDIT / DELETE */}

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenEdit(img)
                      }
                      className="p-2 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50"
                      title="Edit photo"
                    >
                      <Edit size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(img)
                      }
                      disabled={
                        deletingId === img.id
                      }
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                      title="Delete photo"
                    >
                      {deletingId === img.id ? (
                        <span className="text-[10px]">
                          ...
                        </span>
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};