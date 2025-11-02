using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Foot2site_V1.Data;
using Foot2site_V1.Modele;

namespace Foot2site_V1.Controllers
{

    /// <summary>
    /// Controlleur pour gérer les opérations CRUD sur les commandes.
    /// Endpoint : 
    /// GET   /api/Commandes          -> Récupérer toutes les commandes
    /// GET   /api/Commandes/{id}     -> Récupérer une commande par ID
    /// PUT   /api/Commandes/{id}     -> Mettre à jour une commande existante
    /// POST  /api/Commandes          -> Créer une nouvelle commande
    /// DELETE /api/Commandes/{id}     -> Supprimer une commande par ID
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class CommandesController : ControllerBase
    {
        private readonly Foot2site_V1Context _context;

        public CommandesController(Foot2site_V1Context context)
        {
            _context = context;
        }

        // GET: api/Commandes
        /// <summary>
        /// Permet de lister toutes les commandes.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Commande>>> GetCommande()
        {
            return await _context.Commande.ToListAsync();
        }

        // GET: api/Commandes/5
        /// <summary>
        /// Permet de récupérer une commande par son ID.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<Commande>> GetCommande(int id)
        {
            var commande = await _context.Commande.FindAsync(id);

            if (commande == null)
            {
                return NotFound();
            }

            return commande;
        }

        // PUT: api/Commandes/5
        /// <summary>
        /// Permet de mettre à jour une commande existante.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="commande"></param>
        /// <returns></returns>
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCommande(int id, Commande commande)
        {
            if (id != commande.Id)
            {
                return BadRequest();
            }

            _context.Entry(commande).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CommandeExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Commandes
        /// <summary>
        /// Permet de créer une nouvelle commande.
        /// </summary>
        /// <param name="commande"></param>
        /// <returns></returns>
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Commande>> PostCommande(Commande commande)
        {
            _context.Commande.Add(commande);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetCommande", new { id = commande.Id }, commande);
        }

        /// <summary>
        /// Permet de supprimer une commande par son ID.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        // DELETE: api/Commandes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCommande(int id)
        {
            var commande = await _context.Commande.FindAsync(id);
            if (commande == null)
            {
                return NotFound();
            }

            _context.Commande.Remove(commande);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CommandeExists(int id)
        {
            return _context.Commande.Any(e => e.Id == id);
        }
    }
}
