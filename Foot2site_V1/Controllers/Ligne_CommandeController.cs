using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Foot2site_V1.Data;
using Foot2site_V1.Modele;

namespace Foot2site_V1.Controllers
{
    public class Ligne_CommandeController : Controller
    {
        private readonly Foot2site_V1Context _context;

        public Ligne_CommandeController(Foot2site_V1Context context)
        {
            _context = context;
        }

        // GET: Ligne_Commande
        public async Task<IActionResult> Index()
        {
            var foot2site_V1Context = _context.Ligne_Commande.Include(l => l.commande);
            return View(await foot2site_V1Context.ToListAsync());
        }

        // GET: Ligne_Commande/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var ligne_Commande = await _context.Ligne_Commande
                .Include(l => l.commande)
                .FirstOrDefaultAsync(m => m.Id == id);
            if (ligne_Commande == null)
            {
                return NotFound();
            }

            return View(ligne_Commande);
        }

        // GET: Ligne_Commande/Create
        public IActionResult Create()
        {
            ViewData["Id_COMMANDE"] = new SelectList(_context.Commande, "Id", "Id");
            return View();
        }

        // POST: Ligne_Commande/Create
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Id,quantite,prixUnitaire,Id_COMMANDE,Id_STOCK_PRODUIT")] Ligne_Commande ligne_Commande)
        {
            if (ModelState.IsValid)
            {
                _context.Add(ligne_Commande);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            ViewData["Id_COMMANDE"] = new SelectList(_context.Commande, "Id", "Id", ligne_Commande.Id_COMMANDE);
            return View(ligne_Commande);
        }

        // GET: Ligne_Commande/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var ligne_Commande = await _context.Ligne_Commande.FindAsync(id);
            if (ligne_Commande == null)
            {
                return NotFound();
            }
            ViewData["Id_COMMANDE"] = new SelectList(_context.Commande, "Id", "Id", ligne_Commande.Id_COMMANDE);
            return View(ligne_Commande);
        }

        // POST: Ligne_Commande/Edit/5
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("Id,quantite,prixUnitaire,Id_COMMANDE,Id_STOCK_PRODUIT")] Ligne_Commande ligne_Commande)
        {
            if (id != ligne_Commande.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(ligne_Commande);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!Ligne_CommandeExists(ligne_Commande.Id))
                    {
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }
                return RedirectToAction(nameof(Index));
            }
            ViewData["Id_COMMANDE"] = new SelectList(_context.Commande, "Id", "Id", ligne_Commande.Id_COMMANDE);
            return View(ligne_Commande);
        }

        // GET: Ligne_Commande/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var ligne_Commande = await _context.Ligne_Commande
                .Include(l => l.commande)
                .FirstOrDefaultAsync(m => m.Id == id);
            if (ligne_Commande == null)
            {
                return NotFound();
            }

            return View(ligne_Commande);
        }

        // POST: Ligne_Commande/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var ligne_Commande = await _context.Ligne_Commande.FindAsync(id);
            if (ligne_Commande != null)
            {
                _context.Ligne_Commande.Remove(ligne_Commande);
            }

            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        private bool Ligne_CommandeExists(int id)
        {
            return _context.Ligne_Commande.Any(e => e.Id == id);
        }
    }
}
