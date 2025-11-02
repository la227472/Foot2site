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
    /// Controlleur pour gérer les opérations CRUD sur les lignes de commande qui sont les details des articles dans une commande.
    /// Endpoint :
    /// GET   /api/Ligne_Commande          -> Récupérer toutes les lignes de commande
    /// GET   /api/Ligne_Commande/{id}     -> Récupérer une ligne de commande par ID
    /// PUT   /api/Ligne_Commande/{id}     -> Mettre à jour une ligne de commande existante
    /// POST  /api/Ligne_Commande          -> Créer une nouvelle ligne de commande
    /// DELETE /api/Ligne_Commande/{id}     -> Supprimer une ligne de commande par 
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class Ligne_CommandeController : ControllerBase
    {
        private readonly Foot2site_V1Context _context;

        public Ligne_CommandeController(Foot2site_V1Context context)
        {
            _context = context;
        }

        /// <summary>
        /// Récupère la liste de toutes les lignes de commande.
        /// </summary>
        /// <returns></returns>
        // GET: api/Ligne_Commande
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Ligne_Commande>>> GetLigne_Commande()
        {
            return await _context.Ligne_Commande.ToListAsync();
        }

        /// <summary>
        /// Permet de récupérer une ligne de commande spécifique en fonction de son ID.
        ///</summary>
        // GET: api/Ligne_Commande/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Ligne_Commande>> GetLigne_Commande(int id)
        {
            var ligne_Commande = await _context.Ligne_Commande.FindAsync(id);

            if (ligne_Commande == null)
            {
                return NotFound();
            }

            return ligne_Commande;
        }

        /// <summary>
        /// Permet de mettre à jour une ligne de commande existante.
        /// 
        /// </summary>
        /// <param name="id"></param>
        /// <param name="ligne_Commande"></param>
        /// <returns></returns>
        // PUT: api/Ligne_Commande/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutLigne_Commande(int id, Ligne_Commande ligne_Commande)
        {
            if (id != ligne_Commande.Id)
            {
                return BadRequest();
            }

            _context.Entry(ligne_Commande).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!Ligne_CommandeExists(id))
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

        /// <summary>
        /// Permet de créer une nouvelle ligne de commande.
        /// </summary>
        /// <param name="ligne_Commande"></param>
        /// <returns></returns>
        // POST: api/Ligne_Commande
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Ligne_Commande>> PostLigne_Commande(Ligne_Commande ligne_Commande)
        {
            _context.Ligne_Commande.Add(ligne_Commande);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetLigne_Commande", new { id = ligne_Commande.Id }, ligne_Commande);
        }

        /// <summary>
        /// Permet de supprimer une ligne de commande en fonction de son ID.
        /// </summary>
        // DELETE: api/Ligne_Commande/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLigne_Commande(int id)
        {
            var ligne_Commande = await _context.Ligne_Commande.FindAsync(id);
            if (ligne_Commande == null)
            {
                return NotFound();
            }

            _context.Ligne_Commande.Remove(ligne_Commande);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool Ligne_CommandeExists(int id)
        {
            return _context.Ligne_Commande.Any(e => e.Id == id);
        }
    }
}
